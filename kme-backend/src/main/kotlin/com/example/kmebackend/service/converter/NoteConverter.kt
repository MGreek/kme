package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Note
import com.example.kmebackend.model.dto.NoteDTO
import org.mapstruct.Mapper

@Mapper
interface NoteConverter {
    fun noteToDto(note: Note): NoteDTO
}