export default function Select( {options, onChange} ) {
    
    return (
        <select onChange={onChange} className='field'>
            {options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
            ))}
        </select>
    );
}