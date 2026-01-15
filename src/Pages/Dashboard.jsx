import React from 'react';
import { Container, Row, Col } from 'react-bootstrap'; 
import Sidebar from '../components/Sidebar'; 
import DashboardCards from '../components/DashboardCards'; 
import './Dashboard.css' // CSS file import kiya


function Dashboard() {
    return (
        <div className='dashboard-layout'>
        <Container fluid className="p-0 dashboard-layout">
            
            {/* === 1. Top Navigation Bar (TopBar) === */}
            {/* Isko Row ke bahar rakha hai, ya to Row ke andar ek Col bana sakte hain.
               Aapke code ke mutabiq, isko yahan rakhte hain. */}
            <div className='topbar'>
                {/* Yahan aap search, notification icons, ya user profile daal sakte hain */}
                <div className="topbar-content p-3 d-flex justify-content-end align-items-center">
                    {/* Placeholder content */}
                    {/* <p className="mb-0 text-muted">Search, Notifications, Profile</p> */}
                </div>
            </div>
            
            <Row className="g-0">
                
                {/* 1. Sidebar Column (lg={3}) */}
                <Col xs={12} lg={3} className="sidebar-col">
                    <Sidebar />
                </Col>

                {/* 2. Main Content Column (lg={9}) */}
                <Col xs={12} lg={9} className="main-content-col">
                    
                    {/* Topbar ke liye space banaya (padding-top) */}
                    <div className="main-content-wrapper p-4"> 

                        {/* 💳 4 Dashboard Cards Component */}
                        <div className="mt-3"> 
                            <DashboardCards />
                        </div>
                        
                        {/* Baqi Dashboard Widgets Yahan Aayenge */}
                        <Row className="mt-5">
                            <Col>
                                <h3>Other Analytics/Charts</h3>
                                <p>This area can hold more charts, tables, or other dashboard components.</p>
                            </Col>
                        </Row>

                    </div>
                </Col>
            </Row>
        </Container>
        </div>
    );
}

export default Dashboard;