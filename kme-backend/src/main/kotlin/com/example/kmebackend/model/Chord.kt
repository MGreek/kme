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
    @MapsId("groupingEntryId") @OneToOne(optional = false, mappedBy = "chord")
    val groupingEntry: GroupingEntry,
    @OneToOne(optional = false, mappedBy = "chord")
    val stem: Stem,
    @OneToMany(mappedBy = "chord")
    val notes: List<Note> = emptyList(),
    val metadata: String? = null,
)
