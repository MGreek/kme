package com.example.kmebackend.model

import jakarta.persistence.*

enum class StemType {
    Whole,
    Half,
    Quarter,
    Eight,
    Sixteenth,
    Thirtysecond,
    Sixtyfourth,
}

@Embeddable
data class StemId(
    @Embedded
    val chordId: ChordId,
)

@Entity
data class Stem(
    @EmbeddedId
    val stemId: StemId? = null,
    @OneToOne(fetch = FetchType.EAGER)
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
    val stemType: StemType,
    val metadata: String? = null,
)
