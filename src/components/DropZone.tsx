import { useDropzone } from 'react-dropzone';

interface Props { onFile: (f: File) => void; onSample: () => void }

export function DropZone({ onFile, onSample }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'] },
    multiple: false,
    onDrop: (files) => files[0] && onFile(files[0]),
  });
  return (
    <div {...getRootProps({ className: `drop${isDragActive ? ' hot' : ''}` })}>
      <input {...getInputProps()} />
      <p><b>Artifact ZIPをここにドロップ</b></p>
      <p>またはクリックしてファイルを選択（解析はすべてブラウザ内で行い、外部には送信しません）</p>
      <p>
        <button type="button" className="g" onClick={(e) => { e.stopPropagation(); onSample(); }}>
          サンプルデータで試す
        </button>
      </p>
    </div>
  );
}
