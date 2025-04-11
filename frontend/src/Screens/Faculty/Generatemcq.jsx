import React from 'react'

function Generatemcq() {
  return (
    <button onClick={() => window.open("https://quizgenius-exporter.vercel.app/", "_blank")}
    className="text-center rounded-sm px-4 py-2 w-1/5 cursor-pointer ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all bg-blue-500 text-white hover:bg-blue-600 border-b-2 border-blue-500"
>
   Generate MCQ
   </button>
  )
}

export default Generatemcq