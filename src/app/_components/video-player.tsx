'use client';
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { fetchUserViewCountForVideo, insertUserViewCount, updateUserViewCount, insertAnonymousView } from '@/app/_api/user-view-count';
import { HandThumbDownIcon, HandThumbUpIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconActive, HandThumbDownIcon as HandThumbDownIconActive } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { UserLike } from '@/app/_types/user-like';
import { supabase } from '@/utils/supabase/client';
import { createLikeByVideoId, fetchLikeByVideoId, updateLikeByVideoId } from '@/app/_api/user-likes';
import { toggleSaveVideo, isVideoSaved } from '@/app/_api/saved-videos';
import LoginModal from './overlays/login-modal';

interface VideoPlayerProps {
    id: string;
    url: string;
    name: string;
    autoplay?: boolean;
    mute?: boolean;
    width?: string;
    height?: string;
    startTime?: number;
    updateProgression?: (timingData: any) => void;
    viewId?: string;
    setViewId?: (id: string) => void;
    onEnded?: () => void;
    onDuration?: (duration: number) => void;
    onVideoInteraction?: () => void; // Callback to refresh homepage data
}

const VideoPlayer = ({ 
    id, 
    url, 
    name, 
    autoplay = false, 
    mute = false, 
    width = '400px', 
    height = '710px', 
    updateProgression, 
    viewId, 
    setViewId, 
    startTime = 0,
    onEnded,
    onDuration,
    onVideoInteraction 
}: VideoPlayerProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerRef = useRef<any>(null);
    const timingRef = useRef<any>(null);
    const [likeInfo, setLikeInfo] = useState<UserLike | null>(null);
    const [userId, setUserId] = useState<string>('');
    const userViewId = useRef<string>(viewId || '');
    const [isSaved, setIsSaved] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const nameRef = useRef<HTMLParagraphElement>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginAction, setLoginAction] = useState<'like' | 'save'>('like');

    useLayoutEffect(() => {
        // Check if the text is overflowing to decide if the "show more" button is needed
        if (nameRef.current) {
            const isOverflowing = nameRef.current.scrollHeight > nameRef.current.clientHeight;
            setShowExpandButton(isOverflowing);
        }
    }, [name]);

    // Function to create/update view count for user
    const upsertViewCount = async (progression: number) => {
        if (!userId || !id) return;

        try {
            if (userViewId.current) {
                await updateUserViewCount(progression, userViewId.current);
            } else {
                const newViewId = await insertUserViewCount(id, progression);
                if (newViewId && setViewId) {
                    setViewId(newViewId);
                    userViewId.current = newViewId;
                }
            }
        } catch (error) {
            console.error('Error upserting view count:', error);
        }
    };

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
        if (id) {
            setViewId?.(id);
        }
    }, [id, setViewId]);

    useEffect(() => {
        const getLikeInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // If user is not signed in, we do not fetch like or view data
            if (!user) {
                setUserId('');

                setIsGuest(true);

                insertAnonymousView(id, 0);

                return;
            }

            // Check if user is a guest
            await checkGuestStatus(user);

            // Only fetch like/save data if user is not a guest
            if (!isGuest) {
                // Fetch like
                const likeData = await fetchLikeByVideoId(id, user.id);
                setUserId(user.id);
                setLikeInfo(likeData);

                // Fetch view id
                const viewData = await fetchUserViewCountForVideo(user.id, id);

                if (viewData) {
                    userViewId.current = viewData.id;

                    if (setViewId) {
                        setViewId(viewData.id);
                    }
                }

                // Check if video is saved
                const isSaved = await isVideoSaved(user.id, id);
                setIsSaved(isSaved);
            }
        }

        getLikeInfo();
    }, [id, setViewId, isGuest]);

    const handleGuestAction = (action: 'like' | 'save') => {
        setLoginAction(action);
        setShowLoginModal(true);
    };

    const upsertLike = async (like: boolean, dislike: boolean) => {
        // If user is a guest, show login modal
        if (isGuest) {
            handleGuestAction('like');
            return;
        }

        // If like info doesn't exist, we have to create it
        if (!likeInfo) {
            await createLikeByVideoId(id, like, dislike);
            setLikeInfo({
                user_id: userId,
                video_id: id,
                like: like,
                dislike: dislike
            });
        }
        // Else, update like data
        else {
            await updateLikeByVideoId(id, userId, like, dislike);
            setLikeInfo({
                user_id: userId,
                video_id: id,
                like: like,
                dislike: dislike
            });
        }
        
        // Call callback to refresh homepage data
        onVideoInteraction?.();
    }

    const toggleSave = async () => {
        // If user is a guest, show login modal
        if (isGuest) {
            handleGuestAction('save');
            return;
        }

        if (!userId) return;

        try {
            await toggleSaveVideo(userId, id);
            setIsSaved(!isSaved);
            // Call callback to refresh homepage data
            onVideoInteraction?.();
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    }

    return (
        <>
            <div
                className="my-auto rounded-3xl w-full overflow-hidden"
                style={{ maxWidth: width, maxHeight: height }}>
                <div className="relative w-full h-full" style={{ paddingTop: '177%' }}>
                    <iframe
                        id='bunny-player'
                        ref={iframeRef}
                        src={`${url}?autoplay=${autoplay}&mute=${mute}`}
                        loading="lazy"
                        className="border-none absolute top-0 h-full w-full"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media;"
                        allowFullScreen={true}>
                    </iframe>

                    {/* Title and expand button - top */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <div className="flex items-start gap-2 pointer-events-auto">
                            <p
                                ref={nameRef}
                                className={`text-white font-medium text-xl flex-1 ${!expanded ? 'line-clamp-1' : ''}`}
                            >
                                {name}
                            </p>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-white hover:text-gray-300 transition-colors"
                            >
                                {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Like and Save buttons - bottom right */}
                    <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2 pointer-events-auto">
                        <button
                            onClick={() => upsertLike(!likeInfo?.like, false)}
                            className="text-white hover:text-blue-500 transition-colors bg-black/50 rounded-full p-2"
                        >
                            {likeInfo?.like ? (
                                <HandThumbUpIconActive className="h-6 w-6" />
                            ) : (
                                <HandThumbUpIcon className="h-6 w-6" />
                            )}
                        </button>
                        <button
                            onClick={toggleSave}
                            className="text-white hover:text-yellow-500 transition-colors bg-black/50 rounded-full p-2">
                            {isSaved ? (
                                <BookmarkSolid className="h-6 w-6" />
                            ) : (
                                <BookmarkOutline className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwapToSignUp={() => setShowLoginModal(false)}
            />
        </>
    );
};

export default VideoPlayer;
