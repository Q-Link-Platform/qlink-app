import urllib.request
import struct

def inspect_mp4_atoms(url):
    print(f"\n=== INSPECTING MP4 ATOMS FOR: {url} ===")
    req = urllib.request.Request(url, headers={'Range': 'bytes=0-100000'})
    try:
        with urllib.request.urlopen(req) as response:
            data = response.read()
            offset = 0
            atoms = []
            while offset < len(data) - 8:
                size, atom_type = struct.unpack('>I4s', data[offset:offset+8])
                atom_str = atom_type.decode('ascii', errors='ignore')
                print(f"Atom: {atom_str}, Size: {size}, Offset: {offset}")
                atoms.append(atom_str)
                if size == 0:
                    break
                if size == 1: # 64-bit size
                    size = struct.unpack('>Q', data[offset+8:offset+16])[0]
                offset += size
            
            if 'moov' in atoms:
                print("SUCCESS: 'moov' atom is at the BEGINNING! (FastStart MP4 - Web Ready)")
            elif 'mdat' in atoms:
                print("WARNING: 'mdat' is at the beginning, 'moov' is at the END of the file! (NOT FastStart MP4)")
            else:
                print("Unknown atom structure")
    except Exception as e:
        print("Error:", e)

inspect_mp4_atoms("https://ansfsehkrddmrwnjspek.supabase.co/storage/v1/object/public/Autark-3/videos/caeaae7f-1b41-4400-95c1-34f1430c21a3.mp4")
inspect_mp4_atoms("https://ansfsehkrddmrwnjspek.supabase.co/storage/v1/object/public/Autark-3/videos/4026737f-7e8d-4ff6-8005-5bac3eb14c82.mp4")
