export default function Button( {children, onClick} ) {

    return (
        <>
            <button onClick={onClick} className='field'>
                {children}
            </button>
        </>
    )
}