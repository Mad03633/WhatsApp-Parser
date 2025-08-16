import Select from '../../elements/Select/Select';
import DataInput from '../DataInput/DataInput';
import { updateField } from '../../../utils/fetchData';
import { useState } from 'react';

export default function Form( {fields, category, categorySetter} ) {

    return (
        <>
            {fields?.map(({key, label, type, form, options}) => (
                <div>
                    <h5 className={'input-text'}>{label}</h5>
                    {type === "select" ? (
                        <Select
                            options={options}
                            value={category[key]}
                            onChange={(e) => updateField(key, e.target.value, categorySetter)}
                        />
                    ) : (
                        <DataInput
                            type={type}
                            value={category[key]}
                            onChange={(e) =>
                                type === "file"
                                    ? updateField(key, e.target.files[0].name, categorySetter)
                                    : updateField(key, e.target.value, categorySetter)
                            }
                            form={form}
                        />
                    )}
                </div>
            ))}         
        </>
    )
}