package com.example.kmebackend.repository

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StaffRepository : JpaRepository<Staff, StaffId>
