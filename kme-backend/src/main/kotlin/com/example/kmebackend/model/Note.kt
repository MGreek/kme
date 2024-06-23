package com.example.kmebackend.model

import jakarta.persistence.*

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
    val chordId: ChordId? = null,
    val position: Int,
)

@Entity
data class Note(
    @EmbeddedId
    val noteId: NoteId,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        // all columns from ChordId
        JoinColumn(
            name = "staff_system_id",
            referencedColumnName = "staff_system_id",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "staves_order",
            referencedColumnName = "staves_order",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "measures_order",
            referencedColumnName = "measures_order",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "voices_order",
            referencedColumnName = "voices_order",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "groupings_order",
            referencedColumnName = "groupings_order",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "grouping_entries_order",
            referencedColumnName = "grouping_entries_order",
            insertable = false,
            updatable = false,
        ),
    )
    val chord: Chord? = null,
    @Enumerated(EnumType.STRING)
    val accidental: Accidental,
    @Lob
    val metadataJson: String = "",
)