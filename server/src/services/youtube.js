import { YoutubeTranscript } from 'youtube-transcript-plus';

export const fetchTranscript = async (videoUrl) => {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        return transcript.map(item => item.text).join(' ');
    } catch (error) {
        throw new Error('Could not fetch transcript for this video.');
    }
};