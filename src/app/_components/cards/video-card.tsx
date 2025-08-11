import PlayIcon from "@heroicons/react/24/outline/PlayIcon";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toggleSaveVideo, isVideoSaved } from "@/app/_api/saved-videos";
import LoginModal from "../overlays/login-modal";

interface VideoCardProps {
    questionId: string,
    name: string,
    thumbnailUrl: string,
    progression?: number | null,
    videoId?: string
    onRefresh?:any;
}

export default function ExpandedVideoCards({questionId, name, thumbnailUrl, progression, videoId} : VideoCardProps) {
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Check if user is a guest
    const checkGuestStatus = async (user: any) => {
        if (!user) {
            setIsGuest(true);
            return;
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, zip_code')
                .eq('id', user.id)
                .single();

            const isGuestUser = !profile || !profile.first_name || !profile.last_name || !profile.zip_code;
            setIsGuest(isGuestUser);
        } catch (error) {
            console.error('Error checking guest status:', error);
            setIsGuest(true);
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            
            if (currentUser) {
                await checkGuestStatus(currentUser);
                
                if (!isGuest && videoId) {
                    try {
                        const saved = await isVideoSaved(currentUser.id, videoId);
                        setIsSaved(saved);
                    } catch (error) {
                        console.error('Error checking save status:', error);
                    }
                }
            } else {
                setIsGuest(true);
            }
        };
        getUser();
    }, [videoId, isGuest]);

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        
        // If user is a guest, show login modal
        if (isGuest) {
            setShowLoginModal(true);
            return;
        }
        
        if (!user || !videoId) return;
        
        setLoading(true);
        try {
            const newSavedState = await toggleSaveVideo(user.id, videoId);
            setIsSaved(newSavedState);
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative cursor-pointer bg-card-background-primary-gradient rounded-xl p-4 flex flex-col space-y-4 shadow-lg min-w-80 max-w-80 w-full"
            onClick={() => router.push(`/dashboard/question/${questionId}`)}
        >
            <div className="flex items-start w-full">
                <h3 className="text-white font-medium text-lg font-sans flex-1">{name}</h3>
                {user && videoId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation when clicking the bookmark
                            handleSaveToggle(e);
                        }}
                        disabled={loading}
                        className="text-white hover:text-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {isSaved ? (
                            <BookmarkSolid className="h-5 w-5 text-yellow-400" />
                        ) : (
                            <BookmarkOutline className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>

            <div className="relative flex justify-center">
                <img
                    src={thumbnailUrl}
                    alt="Video Thumbnail"
                    className="w-full h-48 rounded-lg object-cover"
                />
                <div className="absolute bottom-2 left-2 w-10 h-10 bg-primary-color-dark opacity-80 rounded-full flex items-center justify-center">
                    <PlayIcon className="h-4 w-4 text-white" />
                </div>
                {progression && (
                    <div className="absolute bottom-4 left-1 bg-green-400 px-2 rounded-md text-white text-sm">
                        <p>{Math.round(progression)}&#37; watched</p>
                    </div>
                )}
            </div>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwapToSignUp={() => setShowLoginModal(false)}
            />
        </div>
    );
}