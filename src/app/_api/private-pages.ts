import { supabase } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Topic } from '../_types';

export type RPCVideoGroupRow = {
  video_id: string;
  video_name: string;
  detailed_topic_section_name: string;
  detailed_topic_name: string;
  topic_name: string;
};

export type VideoGroup = {
  topic_name: string;
  detailed_topic_name: string;
  videos: {
    id: string;
    name: string;
  }[];
};

export const fetchDoctorVideosRPC = async (doctorId: string): Promise<RPCVideoGroupRow[]> => {
  const { data, error } = await supabase.rpc('get_videos_by_doctor_id', {
    p_doctor_id: doctorId,
  });

  if (error) {
    throw new Error(`Error fetching videos by doctor ID: ${error.message}`);
  }

  return data as RPCVideoGroupRow[];
};

//


export const fetchVideosGroupedByDoctorId = async (doctorId: string): Promise<VideoGroup[]> => {
  const flatData = await fetchDoctorVideosRPC(doctorId);

  const map = new Map<string, VideoGroup>();

  for (const row of flatData) {
    const key = `${row.topic_name}-${row.detailed_topic_name}`;

    if (!map.has(key)) {
      map.set(key, {
        topic_name: row.topic_name,
        detailed_topic_name: row.detailed_topic_name,
        videos: [],
      });
    }

    map.get(key)!.videos.push({
      id: row.video_id,
      name: row.video_name,
    });
  }

  return Array.from(map.values());
};

//

export const insertPrivateDocuments = async (
  privatePageId: string,
  fileUrls: string[]
): Promise<void> => {
  const { error } = await supabase
    .from('private_documents')
    .insert(
      fileUrls.map((url) => ({
        private_page_id: privatePageId,
        file_url: url,
      }))
    );

  if (error) {
    throw new Error(`Error inserting into private_documents: ${error.message}`);
  }
};

//privatePageId

export const insertPrivatePage = async (
  doctorId: string,
  patientName: string,
  patientPhone: string
): Promise<string> => {
  const urlToken = uuidv4(); // Generate unique URL token
  const uniqueId = uuidv4().substring(0, 8); // Short unique identifier
  const placeholderEmail = `${patientPhone.trim()}_${uniqueId}@placeholder.medoh`; // Unique email

  const { data, error } = await supabase
    .from('private_pages')
    .insert({
      doctor_id: doctorId,
      patient_email: placeholderEmail,
      name: patientName.trim(),
      patient_phone: patientPhone.trim(),
      url_token: urlToken
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Error inserting into private_pages: ${error.message}`);
  }

  return data.id;
};


//

export const insertPrivateVideos = async (
  privatePageId: string,
  videoIds: string[]
): Promise<void> => {
  const { error } = await supabase
    .from('private_videos')
    .insert(
      videoIds.map((videoId) => ({
        private_page_id: privatePageId,
        video_id: videoId,
      }))
    );

  if (error) {
    throw new Error(`Error inserting into private_videos: ${error.message}`);
  }
};

//

export const createCompletePrivatePage = async (
  doctorId: string,
  patientName: string,
  patientPhone: string,
  files: { file: File; type: string }[],
  videoIds: string[]
): Promise<string> => {
  // 1. Insert private page (no duplicate checking - allow multiple pages per patient)
  const privatePageId = await insertPrivatePage(doctorId, patientName, patientPhone);

  // 2. Upload files
  if (files.length > 0) {
    const insertDocsPayload = [];

    for (const { file, type } of files) {
      const uniqueName = `${privatePageId}/${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('private-documents')
        .upload(uniqueName, file);

      if (error || !data) {
        throw new Error(`Error uploading file ${file.name}: ${error?.message}`);
      }

      // ✅ Get the correct public URL
      const publicUrl = supabase.storage
        .from('private-documents')
        .getPublicUrl(data.path).data.publicUrl;

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User ID not found while inserting documents.');

      insertDocsPayload.push({
        private_page_id: privatePageId,
        file_url: publicUrl, // ✅ This is now a full URL
        file_name: file.name,
        file_type: file.type || extractTypeFromUrl(publicUrl),
        document_type: type,
        uploaded_by: userId,
      });
    }

    const { error: docError } = await supabase
      .from('private_documents')
      .insert(insertDocsPayload);
    if (docError) throw new Error(`Error inserting documents: ${docError.message}`);
  }

  // 3. Insert private videos
  if (videoIds.length > 0) {
    const { error: vidError } = await supabase
      .from('private_videos')
      .insert(videoIds.map((videoId) => ({
        private_page_id: privatePageId,
        video_id: videoId,
      })));

    if (vidError) throw new Error(`Error inserting videos: ${vidError.message}`);
  }

  return `/private-page-patient/${privatePageId}/auth`;
};


function extractTypeFromUrl(url: string): string {
  const parts = url.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'unknown';
}


 // for patient view

// In private-pages.ts
export const fetchFullTopicsByPrivatePageId = async (privatePageId: string): Promise<Topic[]> => {
  const { data, error } = await supabase.rpc('get_full_topics_by_private_page', {
    p_page_id: privatePageId,
  });

  if (error) {
    throw new Error(`Error fetching full topics: ${error.message}`);
  }

  return data;
};

//detailed topic
export const fetchDetailedTopicsByPrivatePageId = async (privatePageId: string) => {
  const { data, error } = await supabase.rpc('get_detailed_topics_by_private_page', {
    p_page_id: privatePageId
  });

  if (error) throw new Error(`Error fetching detailed topics: ${error.message}`);
  return data;
};

//topic name

export const fetchTopicByIdFromDetailedTopic = async (detailedTopicId: string): Promise<{
    name: string; topic_id: string; topic_name: string 
}> => {
  const { data, error } = await supabase.rpc('get_topic_by_detailed_topic', {
    p_detailed_topic_id: detailedTopicId
  });

  if (error || !data || data.length === 0) {
    throw new Error(`Error fetching topic from detailed topic: ${error?.message}`);
  }

  return data[0]; // returns { topic_id, topic_name }
};

//private-page videos

export const fetchPrivateVideosByDetailedTopic = async (
  privatePageId: string,
  detailedTopicId: string
): Promise<any[]> => {
  
  const { data, error } = await supabase
    .rpc('get_private_videos_by_page_and_section', {
      p_private_page_id: privatePageId,
      p_detailed_topic_id: detailedTopicId,
    });

  if (error) {
    throw new Error(`Error fetching private videos: ${error.message}`);
  }

  return data || [];
};

//patients private doc

export const fetchPrivateDocumentsByPageId = async (privatePageId: string) => {
  console.log("privatePageId in documents page:", privatePageId);

  const { data, error } = await supabase
    .from('private_documents')
    .select('id, file_name, file_type, file_url, created_at,document_type')
    .eq('private_page_id', privatePageId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
  console.log("Logger",data);
  return data;
};

// get id of doctor by email.

export const getDoctorIdByEmail = async (email: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('doctors')
    .select('id')
    .eq('email', email.trim())
    .single();

  if (error || !data) {
    console.warn(`Doctor with email ${email} not found: ${error?.message}`);
    return null; // No error thrown, just return null
  }

  return data.id;
};

//get email  by id

export const getDoctorEmailById = async (Id: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('doctors')
    .select('email')
    .eq('id', Id.trim())
    .single();

  if (error || !data) {
    console.warn(`Doctor with ID ${Id} not found: ${error?.message}`);
    return null;
  }

  return data.email;
};

//

export async function doesPrivatePageExist(
  doctorId: string,
  patientEmail: string,
  patientPhone: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('private_pages')
    .select('id')
    .eq('doctor_id', doctorId)
    .or(`patient_email.eq.${patientEmail.trim()},patient_phone.eq.${patientPhone.trim()}`);

  if (error) {
    console.warn('Error checking private page:', error.message);
    return false;
  }

  return data && data.length > 0;
}

//

export async function verifyPrivatePageLogin(
  privatePageId: string,
  email: string,
  otp: string
): Promise<boolean> {
  try {
    // 1. Check if this private page exists for the given email
    const { data: pageData, error: pageError } = await supabase
      .from('private_pages')
      .select('id')
      .eq('id', privatePageId)
      .eq('patient_email', email.trim())
      .single();

    if (pageError || !pageData) {
      console.error('Private page verification failed:', pageError?.message);
      return false; // Page not associated with this email
    }

    // 2. Verify OTP for the email using Supabase auth
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (otpError || !otpData?.user) {
      console.error('OTP verification failed:', otpError?.message);
      return false;
    }

    // ✅ Email and OTP are valid for this private page
    return true;
  } catch (err: any) {
    console.error('Error in verifyPrivatePageLogin:', err.message);
    return false;
  }
}

//

export async function sendOtpToPatientEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false } // Don't create a new user
  });

  if (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
}


// patient private page topics
export type PrivateVideoRow = {
  video_id: string;
  video_name: string;
  section_name: string;
  detailed_topic_name: string;
  topic_id: string;
  topic_name: string;
};

export const fetchPrivateVideosByPageId = async (privatePageId: string) => {
  const { data, error } = await supabase.rpc('get_private_videos_by_page_id', {
    p_private_page_id: privatePageId,
  });

  if (error) {
    console.error('Error fetching private videos:', error);
    throw new Error(`Error fetching private videos: ${error.message}`);
  }

  if (!data || data.length === 0) return [];

  // Transform rows into simple array of topics
  return data.map((row: { topic_id: string; topic_name: string; topic_image: string | null }) => ({
    topic_id: row.topic_id,
    topic_name: row.topic_name,
    topic_image: row.topic_image || '/images/default-topic.png', // fallback image if null
  }));
};



//detailed topics

export type PrivateDetailedTopic = {
  detailed_topic_id: string;
  detailed_topic_name: string;
  image_url?: string | null;
};

export const fetchPrivateDetailedTopics = async (
  privatePageId: string,
  topicId: string
): Promise<PrivateDetailedTopic[]> => {
  const { data, error } = await supabase.rpc('get_private_detailed_topics', {
    p_private_page_id: privatePageId,
    p_topic_id: topicId,
  });

  if (error) {
    console.error('Error fetching private detailed topics:', error);
    throw new Error(error.message);
  }

  return data || [];
};


//detailed section

export type PrivateSection = {
  section_id: string;
  section_name: string;
  videos: {
    video_id: string;
    video_name: string;
    thumbnail_url: string;
    url: string; // Video URL is now always a string
  }[];
};

export const fetchPrivateDetailedTopicSections = async (
  privatePageId: string,
  detailedTopicId: string
): Promise<PrivateSection[]> => {
  console.log("privatePageId",privatePageId);
  console.log("detailedTopicId",detailedTopicId);
  const { data, error } = await supabase.rpc("get_private_videos_by_detailed_topic", {
    p_private_page_id: privatePageId,
    p_detailed_topic_id: detailedTopicId,
  });

  if (error) {
    console.error("Error fetching private detailed topic sections:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];
   
  // Group data by section
  const grouped: Record<string, PrivateSection> = {};

  data.forEach((row: { 
    section_id: string; 
    section_name: string; 
    video_id: string; 
    video_name: string; 
    thumbnail_url: string | null; 
    video_url: string | null; 
  }) => {
    if (!grouped[row.section_id]) {
      grouped[row.section_id] = {
        section_id: row.section_id,
        section_name: row.section_name,
        videos: [],
      };
    }
    grouped[row.section_id].videos.push({
      video_id: row.video_id,
      video_name: row.video_name,
      thumbnail_url: row.thumbnail_url || '/images/default-thumbnail.png', // fallback image
      url: row.video_url || '', // fallback to empty string if null
    });
  });

  return Object.values(grouped);
};


//

export const fetchPrivateDetailedTopicInfo = async (detailedTopicId: string) => {
  const { data, error } = await supabase
    .from('detailed_topics')
    .select('id, name, description, image_url')
    .eq('id', detailedTopicId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

//video playerhelper 2


export async function fetchPrivateVideoById(videoId: string) {

  const { data, error } = await supabase
    .from('videos')
    .select(
      `
      id,
      video_name,
      video_url,
      thumbnail_url,
      doctors (
        id,
        name,
        picture_url,
        specialty,
        city,
        state
      )
    `
    )
    .eq('id', videoId)
    .single();

  if (error) {
    console.error('Error fetching video by ID:', error.message);
    throw new Error(error.message);
  }

  return data;
}

//video player helper 2

export async function fetchAdjacentPrivateVideos(
  privatePageId: string,
  detailedTopicId: string,
  currentVideoId: string
) {

  // Fetch all videos for this private page and detailed topic, ordered
  const { data: videos, error } = await supabase
    .from('private_videos')
    .select(
      `
      video_id,
      videos (
        id,
        video_name,
        thumbnail_url
      )
    `
    )
    .eq('private_page_id', privatePageId)
    .eq('detailed_topic_id', detailedTopicId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching adjacent videos:', error.message);
    throw new Error(error.message);
  }

  // Find the index of the current video
  const idx = videos.findIndex((v) => v.video_id === currentVideoId);
  const prev = idx > 0 ? videos[idx - 1].videos : null;
  const next = idx < videos.length - 1 ? videos[idx + 1].videos : null;

  return { prev, next };
}


export async function fetchQuestionIdByVideoId(videoId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('question_id')
    .eq('id', videoId)
    .single(); // Ensures only one row is returned
    console.log("questoinID1",videoId);
  console.log("questoinID",data);
  if (error) {
    console.error(`Error fetching question_id for video_id ${videoId}:`, error.message);
    return null;
  }

  return data?.question_id || null;
}

// get next and prev videos

export const getAdjacentPrivateVideos = async (
  videoId: string,
  privatePageId: string
): Promise<{
  prev_video_id: string | null;
  next_video_id: string | null;
  video_id: string | null;
  video_name: string | null;
  thumbnail_url: string | null;
}> => {
  const { data, error } = await supabase.rpc('get_adjacent_private_videos', {
    p_current_video: videoId,        // ✅ Correct parameter name
    p_private_page_id: privatePageId // ✅ Correct parameter name
  });

  if (error) {
    console.error('Error fetching adjacent videos:', error);
    throw new Error(error.message);
  }
 
  if (!data || data.length === 0) {
    return {
      prev_video_id: null,
      next_video_id: null,
      video_id: null,
      video_name: null,
      thumbnail_url: null,
    };
  }

  const videoRow = data[0];
  return {
    prev_video_id: videoRow.prev_video_id || null,
    next_video_id: videoRow.next_video_id || null,
    video_id: videoRow.video_id || null,
    video_name: videoRow.out_video_name || null,
    thumbnail_url: videoRow.out_thumbnail_url || null,
  };
};

//
export const fetchDoctorNameByPageId = async (privatePageId: string): Promise<string | null> => {
  // Step 1: Get doctor_id from private_pages
  const { data: privatePage, error: privatePageError } = await supabase
    .from("private_pages")
    .select("doctor_id")
    .eq("id", privatePageId)
    .single();

  if (privatePageError || !privatePage) {
    console.error("Error fetching private page:", privatePageError);
    return null;
  }

  // Step 2: Fetch doctor name from doctors table
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("name")
    .eq("id", privatePage.doctor_id)
    .single();

  if (doctorError || !doctor) {
    console.error("Error fetching doctor name:", doctorError);
    return null;
  }

  return doctor.name || null;
};
// drop down for doctors
export const fetchPrivatePagesByDoctor = async (doctorId: string) => {
  const { data, error } = await supabase
    .from("private_pages")
    .select("id, patient_email, patient_phone, created_at")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching private pages:", error);
    throw error;
  }
  return data;
};

//
export async function isContactAllowedForPrivatePage(
  privatePageId: string,
  contact: string // phone number or email
): Promise<boolean> {

  // Fetch the private page data
  const { data, error } = await supabase
    .from('private_pages')
    .select('patient_email, patient_phone')
    .eq('id', privatePageId)
    .single();

  if (error || !data) {
    console.error('Error fetching private page:', error?.message);
    return false;
  }

  const { patient_email, patient_phone } = data;

  // Check if the contact matches either the phone or email
  return contact === patient_phone || contact === patient_email;
}

//

export const fetchPrivatePagesByDoctorId = async (doctorId: string) => {
  const { data, error } = await supabase
    .from('private_pages')
    .select('id, name, patient_phone, created_at')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching private pages:', error);
    return [];
  }

  return data || [];
};

//prefill
export const fetchPrivatePageById = async (pageId: string) => {
  const { data, error } = await supabase
    .from('private_pages')
    .select('patient_email, patient_phone')
    .eq('id', pageId)
    .single();

  if (error) {
    console.error('Error fetching private page:', error);
    return null;
  }
  return data;
};
//step2
export const fetchPrivatePageSelectedVideos = async (pageId: string) => {
  console.log("datalogger",pageId);
  const { data, error } = await supabase
    .from('private_videos') // your table mapping private pages to videos
    .select('video_id')
    .eq('private_page_id', pageId);
 console.log("datalogger",data);
  if (error) {
    console.error('Error fetching private page videos:', error);
    return [];
  }

  return data.map((row) => row.video_id);
};

export type PrivateDocument = {
  id: string;
  file_name: string;
  document_type: string;
  file_url: string;
  file_type: string;
};

// Fetch existing documents for a private page
export const fetchPrivatePageDocuments = async (pageId: string): Promise<PrivateDocument[]> => {
  const { data, error } = await supabase
    .from('private_documents')
    .select('id, file_name, document_type, file_url, file_type')
    .eq('private_page_id', pageId);

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  return data || [];
};

// Update existing private page: documents and videos
export const updatePrivatePage = async (
  pageId: string,
  files: { id?: string; file?: File; name: string; type: string; existing?: boolean }[],
  videoIds: string[],
  deletedFileIds: string[] = []
) => {
  try {
    // 0. Delete marked files
    if (deletedFileIds.length > 0) {
      for (const fileId of deletedFileIds) {
        const { data: fileData, error: fetchError } = await supabase
          .from('private_documents')
          .select('file_url')
          .eq('id', fileId)
          .single();

        if (fetchError) console.error(`Error fetching file URL for ID ${fileId}:`, fetchError);

        if (fileData?.file_url) {
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('private-documents')
            .remove([fileData.file_url]);

          if (storageError) console.error(`Error deleting file from storage:`, storageError);
        }

        // Delete from private_documents table
        const { error: deleteError } = await supabase
          .from('private_documents')
          .delete()
          .eq('id', fileId);

        if (deleteError) {
          console.error(`Error deleting document ID ${fileId}:`, deleteError);
        }
      }
    }

    // 1. Handle new file uploads
    for (const fileObj of files) {
      if (!fileObj.existing && fileObj.file) {
        const { data: storageData, error: storageError } = await supabase.storage
          .from('private-documents')
          .upload(`${pageId}/${fileObj.file.name}`, fileObj.file, { upsert: true });

        if (storageError) {
          throw new Error(`Failed to upload file: ${storageError.message}`);
        }

        const fileUrl = supabase.storage
        .from('private-documents')
        .getPublicUrl(storageData.path).data.publicUrl;
        const { error: insertError } = await supabase.from('private_documents').insert({
          private_page_id: pageId,
          file_url: fileUrl,
          file_name: fileObj.name,
          file_type: fileObj.file.type,
          document_type: fileObj.type,
          uploaded_by: null,
        });

        if (insertError) {
          throw new Error(`Failed to insert new document: ${insertError.message}`);
        }
      }
    }

    // 2. Update existing documents
    for (const fileObj of files) {
      if (fileObj.existing && fileObj.id) {
        const { error: updateError } = await supabase
          .from('private_documents')
          .update({
            file_name: fileObj.name,
            document_type: fileObj.type,
          })
          .eq('id', fileObj.id);

        if (updateError) {
          console.error(`Error updating document ${fileObj.id}:`, updateError);
        }
      }
    }

    // 3. Update private_videos
    const { error: deleteError } = await supabase
      .from('private_videos')
      .delete()
      .eq('private_page_id', pageId);

    if (deleteError) {
      throw new Error(`Failed to clear existing videos: ${deleteError.message}`);
    }

    const videoInserts = videoIds.map((videoId) => ({
      private_page_id: pageId,
      video_id: videoId,
    }));

    if (videoInserts.length > 0) {
      const { error: videoInsertError } = await supabase
        .from('private_videos')
        .insert(videoInserts);

      if (videoInsertError) {
        throw new Error(`Failed to update videos: ${videoInsertError.message}`);
      }
    }

    return true;
  } catch (err: any) {
    console.error('Error updating private page:', err.message);
    throw err;
  }
};

// Delete entire private page and all associated data
export const deletePrivatePage = async (pageId: string) => {
  try {
    // 1. Delete entire folder from storage for this page
    const { data: folderFiles, error: listError } = await supabase.storage
      .from('private-documents')
      .list(pageId);

    if (listError) {
      console.error('Error listing files in folder:', listError);
    } else if (folderFiles && folderFiles.length > 0) {
      // Delete all files in the folder
      const filesToDelete = folderFiles.map(file => `${pageId}/${file.name}`);
      
      const { error: storageError } = await supabase.storage
        .from('private-documents')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting folder from storage:', storageError);
      } else {
        console.log(`✅ Deleted folder ${pageId} and ${filesToDelete.length} files from storage`);
      }
    }

    // 2. Delete document records from database
    const { error: docDeleteError } = await supabase
      .from('private_documents')
      .delete()
      .eq('private_page_id', pageId);

    if (docDeleteError) {
      console.error('Error deleting documents from database:', docDeleteError);
    }

    // 3. Delete all videos from private_videos table
    const { error: videoDeleteError } = await supabase
      .from('private_videos')
      .delete()
      .eq('private_page_id', pageId);

    if (videoDeleteError) {
      console.error('Error deleting private videos:', videoDeleteError);
    }

    // 4. Delete the private page itself
    const { error: pageDeleteError } = await supabase
      .from('private_pages')
      .delete()
      .eq('id', pageId);

    if (pageDeleteError) {
      throw new Error(`Failed to delete private page: ${pageDeleteError.message}`);
    }

    return true;
  } catch (err: any) {
    console.error('Error deleting private page:', err.message);
    throw err;
  }
};

//slide show
export const fetchPrivateVideosByVideoId = async (
  privatePageId: string,
  videoId: string
): Promise<any[]> => {
  const { data, error } = await supabase.rpc(
    'get_all_private_detailed_topic_section_videos',
    {
      p_private_page_id: privatePageId,
      p_video_id: videoId,
    }
  );

  if (error) {
    console.error('Error fetching private videos by videoId:', error);
    throw new Error(error.message);
  }

  return (data || []).map((item: any) => ({
    section_id: item.out_section_id,
    video_id: item.out_video_id,
    name: item.name,
    question_id: item.question_id,
    thumbnail_url: item.thumbnail_url,
    video_url: item.video_url,
  }));
};


// for deleting the folders of s3
async function deleteFolder(bucket: string, folderPath: string) {
  const { data: files, error: listError } = await supabase
    .storage
    .from(bucket)
    .list(folderPath);

  if (listError) throw new Error(`Failed to list files in folder ${folderPath}: ${listError.message}`);

  const paths = files.map(file => `${folderPath}/${file.name}`);
  if (paths.length > 0) {
    const { error: removeError } = await supabase.storage.from(bucket).remove(paths);
    if (removeError) throw new Error(`Failed to delete folder files: ${removeError.message}`);
  }
}
// for deleting the pages entirely
export const deletePrivatePageAndAssets = async (pageId: string): Promise<void> => {
  // 1. Delete files directly from URLs (safety)
  const { data: documents, error: docError } = await supabase
    .from('private_documents')
    .select('file_url')
    .eq('private_page_id', pageId);

  if (docError) throw new Error(`Failed to fetch documents: ${docError.message}`);

  const s3Paths = documents.map((doc) => {
    const match = doc.file_url?.match(/\/storage\/v1\/object\/public\/([^?]+)/);
    return match?.[1];
  }).filter(Boolean);

  if (s3Paths.length > 0) {
    const { error: storageError } = await supabase.storage.from('private-documents').remove(s3Paths as string[]);
    if (storageError) throw new Error(`Failed to delete S3 objects: ${storageError.message}`);
  }

  // 2. Delete entire folder for the page (to clean up stray files)
  await deleteFolder('private-documents', pageId); // <--- updated bucket name here

  // 3. Delete private_videos
  const { error: videoError } = await supabase
    .from('private_videos')
    .delete()
    .eq('private_page_id', pageId);
  if (videoError) throw new Error(`Failed to delete private_videos: ${videoError.message}`);

  // 4. Delete private_documents
  const { error: docDeleteError } = await supabase
    .from('private_documents')
    .delete()
    .eq('private_page_id', pageId);
  if (docDeleteError) throw new Error(`Failed to delete private_documents: ${docDeleteError.message}`);

  // 5. Delete private_pages
  const { error: pageError } = await supabase
    .from('private_pages')
    .delete()
    .eq('id', pageId);
  if (pageError) throw new Error(`Failed to delete private_page: ${pageError.message}`);
};