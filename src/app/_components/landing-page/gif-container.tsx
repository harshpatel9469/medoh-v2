'use client'
import { useRouter } from 'next/navigation';
import Gif from './gif';

interface GifProps {
    id: string;
    path: string;
    name: string;
}
const GifContainer = ({ gifs }: { gifs: GifProps[] }) => {
    const router = useRouter();
    return (
        <div className="flex flex-wrap justify-center w-full space-x-4 my-6 cursor-pointer">
            {gifs.map((gif) => (
                <div key={gif.id} onClick={() => router.push(`/dashboard/question/${gif.id}`)}>
                    <Gif
                        key={gif.id}
                        path={gif.path}
                        name={gif.name}
                    />
                </div>
            ))}
        </div>
    );
};

export default GifContainer;