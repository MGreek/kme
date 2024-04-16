package com.example.kmebackend.model

import jakarta.persistence.*
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

@Embeddable
data class ChordId(
    @Embedded
    val groupingEntryId: GroupingEntryId,
)

@Entity
data class Chord(
    @EmbeddedId
    val chordId: ChordId? = null,
    @OneToOne(cascade = [CascadeType.ALL])
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
    @AttributeOverride(name = "metadata", column = Column(name = "stem_metadata"))
    val stem: Stem,
    @field:[Min(0) Max(4)] val dotCount: Long,
    val metadata: String? = null,
)