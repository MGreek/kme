package com.example.kmebackend.model

import jakarta.persistence.*

enum class RestType {
    Whole,
    Half,
    Quarter,
    Eight,
    Sixteenth,
    Thirtysecond,
    Sixtyfourth,
}

@Embeddable
data class RestId(
    @Embedded
    val groupingEntryId: GroupingEntryId,
)

@Entity
data class Rest(
    @EmbeddedId
    val restId: RestId? = null,
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
    @Enumerated(EnumType.STRING)
    val restType: RestType,
    val position: Int,
    val metadata: String? = null,
)