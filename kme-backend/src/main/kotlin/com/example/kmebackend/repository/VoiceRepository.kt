package com.example.kmebackend.repository

import com.example.kmebackend.model.Voice
import com.example.kmebackend.model.VoiceId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface VoiceRepository : JpaRepository<Voice, VoiceId>