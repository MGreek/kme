package com.example.kmebackend.repository

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.MeasureId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MeasureRepository : JpaRepository<Measure, MeasureId>