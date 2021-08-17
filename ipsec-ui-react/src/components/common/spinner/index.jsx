import './styles.scss';

export const Spinner = () => {
    const loading = false;

    if(loading) {
        return (
            <div className="loader">
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
                <div className="loader__dot"></div>
            </div>
        );
    }
        return null;
}
