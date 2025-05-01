/**
 * Converts the image to base64 for the Google OCR.
 * Uses the File Web API (FileReader) to asynchronously read and encode the image.
 * 
 * @param imageFile - The image File object uploaded by the user.
 * @returns A Promise that resolves to the base64 string of the image content.
 */
export const Base64Convert = (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new FileReader instance to read the image file
      let reader = new FileReader();

      // Event: when file has been read successfully
      reader.onload = () => {
        const result = reader.result as string;

        // Split the data URI to get the base64 content only
        const base64Data = result.split(",")[1];

        // If no base64 data found, reject with error
        if (!base64Data) reject("Base64 conversion failed");

        // Otherwise, resolve with the base64 string
        resolve(base64Data);
      };

      // Event: when reading the file fails
      reader.onerror = () => {
        reject("Error reading file");
      };

      // Start reading the file as a data URL
      reader.readAsDataURL(imageFile);
    } catch (error) {
      reject("Base64 conversion failed");
    }
  });
};
