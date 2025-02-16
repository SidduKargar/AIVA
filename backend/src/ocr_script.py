import pytesseract
from PIL import Image
import sys
import io

# Ensure UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def enhance_image(image):
    # Convert to grayscale
    grayscale = image.convert('L')
    
    # Increase contrast
    enhanced = grayscale.point(lambda x: 0 if x < 128 else 255, '1')
    
    return enhanced

def extract_text(image_path):
    try:
        # Open the image
        image = Image.open(image_path)
        
        # Enhance image for better OCR
        enhanced_image = enhance_image(image)
        
        # Configure pytesseract
        custom_config = r'--oem 3 --psm 6'
        
        # Extract text
        text = pytesseract.image_to_string(enhanced_image, config=custom_config)
        
        return text.strip()
    except Exception as e:
        print(f"Error processing image: {str(e)}", file=sys.stderr)
        return ""

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide an image path", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    extracted_text = extract_text(image_path)
    print(extracted_text)