package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class ChordId(
    @Embedded
    val groupingEntryId: GroupingEntryId,
)

@Entity
data class Chord(
    @EmbeddedId
    val chordId: ChordId,
    @OneToOne(mappedBy = "chord")
    val groupingEntry: GroupingEntry,
    @OneToOne(cascade = [CascadeType.PERSIST])
    @JoinColumns(
        // all columns from StemId
        JoinColumn(name = "staff_system_id", insertable = false, updatable = false),
        JoinColumn(name = "staves_order", insertable = false, updatable = false),
        JoinColumn(name = "measures_order", insertable = false, updatable = false),
        JoinColumn(name = "voices_order", insertable = false, updatable = false),
        JoinColumn(name = "groupings_order", insertable = false, updatable = false),
        JoinColumn(name = "grouping_entries_order", insertable = false, updatable = false),
    )
    val stem: Stem,
    @OneToMany(mappedBy = "chord", cascade = [CascadeType.PERSIST])
    val notes: List<Note> = emptyList(),
    val metadata: String? = null,
)
