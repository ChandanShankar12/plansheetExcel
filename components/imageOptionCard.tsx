interface ImageOptionCardProps {
  title: string;
}

const ImageOptionCard = ({ title }: ImageOptionCardProps) => {
  return (
    <>
      <img 
        src="/images/blanksheet.jpg" 
        alt="Blank Excel Sheet" 
        style={{ width: '200px', height: '150px' }}
        className="mb-2" 
      />
      <span className="text-left">{title}</span>
    </>
  )
}

export default ImageOptionCard