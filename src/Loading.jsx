import quran from './assets/img/logo.svg'

const Loading = () => {
    return (
        <div className="loading">
            <div className="loading-logo-wrap">
                <div className="loading-ring" />
                <img src={quran} alt="WoV logo" />
            </div>
            <p className="loading-brand">Whisper of Verses</p>
            <span className="loading-dots">
                <span /><span /><span />
            </span>
        </div>
    )
}

export default Loading