import { useMemo } from 'react';
import { InfiniteSlider } from './motion-primitives/infinite-slider';

export default function SliderBg() {

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const shuffledArrays = useMemo(() => {
        const logos = [
            "/api_logo/chatGPT.png",
            "/api_logo/claude.png",
            "/api_logo/llama.png",
            "/api_logo/qwen.png",
            "/api_logo/gemma.png",
            "/api_logo/gemini.png",
            "/api_logo/mistral.png",
        ];
        return Array.from({ length: 7 }, () => shuffleArray(logos));
    }, []);


    return (
        <div className='absolute w-full flex flex-col gap-10 opacity-5'>
            {shuffledArrays.map((shuffledLogos, index) => (
                <div className='relative w-full h-30'>
                    <InfiniteSlider key={index} gap={24} reverse={index % 2 === 0}>
                        {shuffledLogos.map((logo, logoIndex) => (
                            <img key={`slider-${logoIndex}`} src={logo} className="h-30 w-auto" />
                        ))}
                    </InfiniteSlider>
                </div>
            ))}
        </div>

    );
}