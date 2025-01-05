import ImageOptionCard from '../components/imageOptionCard'

const NewFileSection = () => {
  const cardTitles = [
    "Create a New Excel File",
    "Create with AI Support"
    // Added example title to demonstrate variable usage
  ];

  return (
    <section className="flex space-x-4 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">New File</h2>
        <div className="flex space-x-4">
          {cardTitles.map((title, index) => (
            <div key={index} className="flex flex-col items-left">
              <ImageOptionCard title={title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewFileSection;