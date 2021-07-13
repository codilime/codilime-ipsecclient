import React from 'react'

export default function Dump(props) {
    let label = null;
    if (props.label) {
        label = (<span><strong>{props.label || ''}</strong> = </span>);
    }

    return (
        <div style={{margin: '1rem 0'}}>
            <h3 style={{fontFamily: 'monospace'}}/>
            <small>
				<pre style={{background: '#f0f3f5', padding: '.5rem'}}>
					{label}
                    {JSON.stringify(props.value, null, 2)}
	            </pre>
            </small>
        </div>
    );
}