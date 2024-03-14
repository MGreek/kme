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
    val chordId: ChordId? = null,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        // all columns from GroupingEntryId
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
    val groupingEntry: GroupingEntry? = null,
    @Embedded
    val stem: Stem,
    val metadata: String? = null,
)
