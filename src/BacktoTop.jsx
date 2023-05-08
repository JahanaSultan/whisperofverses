import { useEffect, useState } from "react"
const BacktoTop = () => {

    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 400) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        });
    }, []);


    return (
        <div className={showTopBtn ? "backtotop translate" : "backtotop"}
            onClick={() => window.scrollTo(0, 0)}>
            <i className="ri-arrow-up-s-line"></i>
        </div>
    )
}

export default BacktoTop