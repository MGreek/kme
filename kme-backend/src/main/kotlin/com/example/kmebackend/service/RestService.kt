package com.example.kmebackend.service

import com.example.kmebackend.repository.RestRepository
import org.springframework.stereotype.Service

@Service
data class RestService(
    val restRepository: RestRepository,
)
