import './styles.scss';

export const Spinner = () => {
    const loading = false;

    if(loading) {
        return (
            <div className="spinner"></div>
        );
    } else {
        return null;
    }
}