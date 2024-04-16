package com.example.kmebackend.repository

import com.example.kmebackend.model.Note
import com.example.kmebackend.model.NoteId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NoteRepository : JpaRepository<Note, NoteId>