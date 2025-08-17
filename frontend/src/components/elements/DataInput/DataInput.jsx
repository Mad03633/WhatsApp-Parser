import InputStyle from './dataInput.module.css';
import { useRef, useEffect } from 'react';

export default function DataInput({type, value, onChange, form }) {
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(adjustHeight, [value]);

    return (
        <>
            {form === 'input' && (
                <div>
                    <input 
                        type={type}
                        value={value} 
                        onChange={onChange} 
                        className={InputStyle.input} 
                    />
                </div> 
            )} 

            {form === 'file' && (
                <div>
                    <input 
                        type={type}
                        onChange={onChange} 
                        className={InputStyle.input} 
                    />
                </div> 
            )}

            {form === 'textarea' && (
                <div>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(event) => { 
                            adjustHeight(); 
                            onChange(event); 
                        }}
                        className={InputStyle.textarea}
                    />
                </div>
            )}
        </>
    );
}
