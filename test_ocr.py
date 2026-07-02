import objc
from Foundation import NSURL
from Quartz.PDFKit import PDFDocument
from Vision import VNImageRequestHandler, VNRecognizeTextRequest

def recognize_text(pdf_path, page_num=0):
    url = NSURL.fileURLWithPath_(pdf_path)
    pdf = PDFDocument.alloc().initWithURL_(url)
    if not pdf:
        print("Failed to load PDF")
        return
    
    page = pdf.pageAtIndex_(page_num)
    # Get thumbnail to convert to CGImage
    # Wait, page.thumbnailOfSize_forBox_ can be used
    rect = page.boundsForBox_(0) # kPDFDisplayBoxMediaBox = 0
    # Increase resolution
    rect.size.width *= 2
    rect.size.height *= 2
    image = page.thumbnailOfSize_forBox_(rect.size, 0)
    
    # NSImage to CGImage
    cg_image = image.CGImageForProposedRect_context_hints_(None, None, None)[0]
    
    handler = VNImageRequestHandler.alloc().initWithCGImage_options_(cg_image, None)
    
    texts = []
    def completion_handler(request, error):
        if error:
            print(error)
            return
        for observation in request.results():
            texts.append(observation.topCandidates_(1)[0].string())
            
    request = VNRecognizeTextRequest.alloc().initWithCompletionHandler_(completion_handler)
    request.setRecognitionLanguages_(["ko-KR", "en-US"])
    request.setUsesLanguageCorrection_(True)
    
    handler.performRequests_error_([request], None)
    
    print("Extracted Text:")
    print("\n".join(texts))

if __name__ == '__main__':
    recognize_text('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/CCF_000007.pdf')
