import { Link } from 'react-router-dom'


const Verse = (props) => {

  const copyToClipboard = () => {
    const verse_az = document.querySelectorAll(".verse-az")
    const verse_ar = document.querySelectorAll(".verse-ar")
    const copy = document.querySelectorAll(".copy")
    copy.forEach(e=>e.innerHTML=`<i class="ri-file-copy-line"></i>`)
    const copyText_az = verse_az[props.verse - 1]
    const copyText_ar = verse_ar[props.verse - 1]
    const verseText = copyText_ar.innerText + "\n" + "\n" + copyText_az.innerText + " (" + copyText_az.dataset.chapter + " " + copyText_az.dataset.verse + ")"
    navigator.clipboard.writeText(verseText)
    copy[props.verse - 1].innerHTML = `<i class="ri-check-line"></i>`
  }


  return (
    <li id={`verse${props.verse}`}>
      <span>{props.verse}.</span>
      <div className={props.search ? "chapter-text search" : "chapter-text"}>
        <div class="verse-ar">{props.verse_ar ? props.verse_ar : (<Link to={`/chapter/${props.chapter}`}>{props.chapter_name} <i class="ri-arrow-right-double-line"></i></Link>)}</div>
        {props.audio ?
          (<div className="audio">
            <audio controls>
              <source src={props.audio} type="audio/ogg" />
            </audio>
          </div>) : null}
        <div className='verse-az' data-chapter={props.chapter} data-verse={props.verse}>{props.verse_az}</div>
      </div>
      {props.search ? null : (<span className='copy' onClick={copyToClipboard}><i class="ri-file-copy-line"></i></span>)}
    </li>
  )
}

export default Verse