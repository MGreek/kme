package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Note
import com.example.kmebackend.model.dto.NoteDTO
import com.example.kmebackend.repository.ChordRepository
import org.mapstruct.Mapper
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class NoteConverter {
    @Autowired
    private lateinit var chordRepository: ChordRepository

    abstract fun noteToDto(note: Note): NoteDTO

    fun dtoToNote(noteDTO: NoteDTO): Note {
        val parentId = noteDTO.noteId.chordId
        val parent = if (parentId != null) chordRepository.findById(parentId).orElse(null) else null

        return Note(noteDTO.noteId, parent, noteDTO.accidental, noteDTO.metadataJson)
    }
}