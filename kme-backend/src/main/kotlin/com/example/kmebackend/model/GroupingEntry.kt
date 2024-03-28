package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class GroupingEntryId(
    @Embedded
    val groupingId: GroupingId,
    @Column(name = "grouping_entries_order")
    val groupingEntriesOrder: Int,
)

@Entity
data class GroupingEntry(
    @EmbeddedId
    val groupingEntryId: GroupingEntryId? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        // all columns from GroupingId
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
    )
    val grouping: Grouping? = null,
)
