package com.example.kmebackend.repository

import com.example.kmebackend.model.Chord
import com.example.kmebackend.model.ChordId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ChordRepository : JpaRepository<Chord, ChordId>
