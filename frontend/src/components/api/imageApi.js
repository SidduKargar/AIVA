const generateImage = async (prompt) => {
    try {
      const response = await fetch('http://localhost:3000/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  };
  
  export { generateImage };