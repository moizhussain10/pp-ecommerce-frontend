import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
// Icons ke liye (humne simple Bootstrap icon classes ka use kiya hai)
// Agar aap react-bootstrap-icons use kar rahe hain, to uske component use karein.
import { Building, People, Person, Clock } from 'react-bootstrap-icons'; 

import './DashboardCards.css'; // Styling ke liye

const cardData = [
    {
        title: "Total Offices",
        value: "19",
        icon: <Building />, 
        color: "#ffd700" // Yellow
    },
    {
        title: "Total Teams",
        value: "9",
        icon: <People />, 
        color: "#ff6347" // Red
    },
    {
        title: "Active Employees",
        value: "44",
        icon: <Person />, 
        color: "#3cb371" // Green
    },
    {
        title: "Total Present",
        value: "0",
        icon: <Clock />, 
        color: "#4682b4" // Blue
    },
];

const DashboardCards = () => {
    return (
        // Row for responsiveness, g-4 for gap between cards
        <Row className="dashboard-cards g-4">
            {cardData.map((card, index) => (
                // Har card ke liye Col, jo choti screen par neeche aa jayega
                <Col key={index} xs={12} sm={6} lg={3}> 
                    <Card className="shadow-sm border-0 card-stat">
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            
                            {/* Icon Section */}
                            <div className="card-icon-container" style={{ color: card.color }}>
                                {/* Icon ko style karne ke liye Card.color use kiya */}
                                {card.icon}
                            </div>
                            
                            {/* Text and Value Section */}
                            <div className="ms-3">
                                <p className="card-title-text mb-0">{card.title}</p>
                                <h3 className="card-value-number mb-0">{card.value}</h3>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default DashboardCards;