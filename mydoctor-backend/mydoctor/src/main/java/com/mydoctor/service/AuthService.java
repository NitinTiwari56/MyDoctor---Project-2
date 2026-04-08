package com.mydoctor.service;

import com.mydoctor.dto.request.LoginRequest;
import com.mydoctor.dto.request.RegisterRequest;
import com.mydoctor.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
