export const chunkTranscript = (transcript, maxChunkLength = 15000) => {
    const chunks = [];
    let currentChunk = '';
    const sentences = transcript.split('. ');

    for (const sentence of sentences) {
        if ((currentChunk.length + sentence.length) > maxChunkLength) {
            chunks.push(currentChunk);
            currentChunk = sentence + '. ';
        } else {
            currentChunk += sentence + '. ';
        }
    }
    
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk);
    }
    
    return chunks;
};