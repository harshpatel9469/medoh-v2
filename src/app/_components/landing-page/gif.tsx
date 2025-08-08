import Image from 'next/image';

interface GifProps {
    path: string;
    name: string;
    width?: string;
    height?: string;
}
const Gif = ({ path, name, width = '300px', height = '500px' }: GifProps) => {
    return (
        <div className="flex flex-col items-center justify-center m-auto rounded-xl overflow-hidden"
             style={{ width: width, height: height }}>
            <div className="relative w-full h-full">
                <Image
                    src={path}
                    alt={name}
                    layout="fill"
                    objectFit="cover"
                />
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-gray-800 to-transparent"></div>
                    <div className="absolute top-0 left-0 p-8">
                        <p className="text-white font-medium text-xl font-sans">{name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gif;