import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // useNavigate import kiya
import logo from "../assets/logo-astrik.png";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../Config/firebase.js";

// === Firebase Auth Import (Assuming you use Firebase) ===
// Ise apni project structure ke mutabiq adjust karein.
// import { signOut } from "firebase/auth"; 
// import { auth } from "../firebase-config"; 

// === Custom Hook/Context (Assuming you use a context for user state) ===
// import { useAuth } from "../context/AuthContext"; 

// Icons
import {
  HouseDoorFill,
  People,
  Wallet,
  FileEarmarkText,
  ClipboardCheck,
  Gear,
  BoxArrowRight,
  Building,
  PlusSquareFill,
} from "react-bootstrap-icons";

import "./Sidebar.css";

const Sidebar = ({logout}) => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  // === Hooks Initialization ===
  const navigate = useNavigate(); // useNavigate hook
  // const { logout } = useAuth(); // Custom auth context hook

  // Dhyan dein: Agar aap real Firebase/Context use kar rahe hain, toh uper
  // diye gaye commented imports aur hooks ko uncomment karke sahi path dein.

  const handleItemClick = (name) => {
    setActiveItem(name);
  };

  // Logout function ko is tarah se define kiya gaya hai
  const handleLogout = async () => {
    console.log("Attempting to log out...");
    try {
      // 1. Firebase se Sign Out (Agar use kar rahe hain toh uncomment karein)
      await signOut(auth);
      
      // 2. Local State/Context update karna
      logout(false); // Jaise aapne code mein diya tha
      
      // 3. User ko Login page par redirect karna
      navigate("/login"); 
      
      alert("Logout Successful!");
      
    } catch (error) {
    }
  };

  // Menu items groups wahi rahenge
  const menuGroups = [
    {
      title: "GENERAL",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <HouseDoorFill />,
          showAdd: false,
        },
        // ... (Baki items) ...
        { name: "Employee", path: "/employee", icon: <People />, showAdd: false, },
        { name: "Payroll", path: "/payroll", icon: <Wallet />, showAdd: false },
        { name: "Finance", path: "/finance", icon: <FileEarmarkText />, showAdd: false, },
        { name: "Task Employee", path: "/tasks", icon: <ClipboardCheck />, showAdd: false, },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        { name: "Settings", path: "/settings", icon: <Gear />, showAdd: false },
        {
          name: "Logout",
          path: "/login",
          icon: <BoxArrowRight style={{ transform: "rotate(180deg)" }} />,
          showAdd: false,
          // 4. Logout button par handleLogout function ko call kiya
          // onClick is Nav.Link par laga sakte hain
          onClick: handleLogout 
        },
      ],
    },
  ];

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo-container px-4 py-3">
        <img src={logo} alt="Company Logo" className="sidebar-logo" />
      </div>

      {/* Navigation Menu */}
      <Nav className="flex-column mt-2">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="sidebar-group">
            {/* Group Heading */}
            <div className="sidebar-group-title px-4 mt-3 mb-1">
              {group.title}
            </div>

            {/* Group Items */}
            {group.items.map((item) => (
              <Nav.Link
                as={Link}
                to={item.path}
                key={item.name}
                // Agar item ka custom onClick hai, toh use call karein
                onClick={item.onClick ? item.onClick : () => handleItemClick(item.name)} 
                className={`sidebar-item d-flex align-items-center ${
                  activeItem === item.name ? "active" : ""
                }`}
              >
                {/* Icon component */}
                <span className="sidebar-icon">{item.icon}</span>

                {/* Item ka Naam */}
                <span className="ms-3 sidebar-item-name">{item.name}</span>

                {item.showAdd && (
                  <div className="ms-auto add-button-container">
                    <PlusSquareFill className="add-icon" />
                  </div>
                )}
              </Nav.Link>
            ))}
          </div>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;