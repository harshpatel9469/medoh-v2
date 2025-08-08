export interface UserLike {
    user_id: string;
    video_id: string;
    like: boolean;
    dislike: boolean;
    updated_at?: Date;
}