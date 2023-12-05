import { Link } from 'react-router-dom'


const Verse = (props) => {

  const copyToClipboard = () => {
    const verse_az = document.querySelectorAll(".verse-az")
    const verse_ar = document.querySelectorAll(".verse-ar")
    const copy = document.querySelectorAll(".copy")
    copy.forEach(e=>e.innerHTML=`<i className="ri-file-copy-line"></i>`)
    const copyText_az = verse_az[props.verse - 1]
    const copyText_ar = verse_ar[props.verse - 1]
    const verseText = copyText_ar.innerText + "\n" + "\n" + copyText_az.innerText + " (" + copyText_az.dataset.chapter + " " + copyText_az.dataset.verse + ")"
    navigator.clipboard.writeText(verseText)
    copy[props.verse - 1].innerHTML = `<i className="ri-check-line"></i>`
  }


  return (
    <li id={`verse${props.verse}`}>
      <div className="verse-top"> <span>{props.verse}.</span> {props.search ? null : (<span className='copy' onClick={copyToClipboard}><i className="ri-file-copy-line"></i></span>)}</div>
     
      <div className="chapter-text">
        <div className="verse-ar">{props.verse_ar ? props.verse_ar : (<Link to={`/chapter/${props.chapter}`}>{props.chapter_name} <i className="ri-arrow-right-double-line"></i></Link>)}</div>
        {props.audio ?
          (<div className="audio">
            <audio controls>
              <source src={props.audio} type="audio/ogg" />
            </audio>
          </div>) : null}
        <div className='verse-az' data-chapter={props.chapter} data-verse={props.verse}>{props.verse_az}</div>
      </div>
    </li>
  )
}

export default Verse