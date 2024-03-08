package com.example.kmebackend.model

import jakarta.persistence.*
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

enum class Accidental {
    DoubleFlat,
    Flat,
    None,
    Natural,
    Sharp,
    DoubleSharp,
}

@Embeddable
data class NoteId(
    @Embedded
    val chordId: ChordId,
    val position: Long,
)

@Entity
data class Note(
    @EmbeddedId
    val noteId: NoteId,
    @MapsId("chordId") @ManyToOne
    val chord: Chord,
    @Enumerated(EnumType.STRING)
    val accidental: Accidental,
    @Min(0) @Max(4)
    val dotCount: Long,
    val metadata: String? = null,
)
