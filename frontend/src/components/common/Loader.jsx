import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ message = 'Loading...' }) => (
    <div className="loading-spinner">
        <div className="text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">{message}</p>
        </div>
    </div>
);

export default Loader;
