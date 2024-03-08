package com.example.kmebackend.repository

import com.example.kmebackend.model.Stem
import com.example.kmebackend.model.StemId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StemRepository : JpaRepository<Stem, StemId>