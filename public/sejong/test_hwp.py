import olefile
import zlib
import sys

def get_hwp_text(filename):
    f = olefile.OleFileIO(filename)
    dirs = f.listdir()
    
    bodytext_streams = [d for d in dirs if d[0] == 'BodyText']
    if not bodytext_streams:
        return "No BodyText found"
        
    text = ""
    for stream_path in bodytext_streams:
        stream = f.openstream(stream_path)
        data = stream.read()
        try:
            decompressed = zlib.decompress(data, -15)
        except zlib.error:
            decompressed = data
            
        # HWP5 text is mostly utf-16le. We can just try to decode it and print some.
        text += decompressed.decode('utf-16le', errors='ignore')
        
    return text

print(get_hwp_text(sys.argv[1])[:1000])
