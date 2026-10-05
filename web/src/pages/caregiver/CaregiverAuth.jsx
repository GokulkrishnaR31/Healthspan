import React from 'react';
import Login from '../Login';

export default function CaregiverAuth() {
  // Re-uses the unified Login component which provides both Email & Password and Mobile OTP for all roles
  return <Login />;
}
