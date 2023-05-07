import quran from './assets/img/quran.svg'

const Loading = () => {
    return (
        <div className="loading">
        <img src={quran} alt=""/>
        <h2>Yüklənir...</h2>
    </div>
    )
}

export default Loading